#!/usr/bin/env bun
/**
 * Test script to verify Gemini API connectivity and rate limits.
 *
 * Usage:
 *   GEMINI_API_KEY=your_key bun run scripts/experiment-label/test-gemini.ts
 *
 * Tests:
 *   1. Simple text generation to verify API key works
 *   2. Rate limit behavior with multiple requests
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const MODELS_TO_TEST = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
];

async function testModel(genAI: GoogleGenerativeAI, modelName: string): Promise<{
  model: string;
  success: boolean;
  latencyMs: number;
  error?: string;
}> {
  const start = Date.now();

  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Say 'hello' in one word.");
    const text = result.response.text();

    return {
      model: modelName,
      success: true,
      latencyMs: Date.now() - start,
    };
  } catch (error) {
    return {
      model: modelName,
      success: false,
      latencyMs: Date.now() - start,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function testRateLimits(genAI: GoogleGenerativeAI, modelName: string, numRequests: number): Promise<void> {
  console.log(`\nTesting rate limits for ${modelName} with ${numRequests} sequential requests...`);

  const model = genAI.getGenerativeModel({ model: modelName });
  const results: { index: number; success: boolean; latencyMs: number; error?: string }[] = [];

  for (let i = 0; i < numRequests; i++) {
    const start = Date.now();
    try {
      await model.generateContent(`Say the number ${i + 1} in one word.`);
      results.push({ index: i + 1, success: true, latencyMs: Date.now() - start });
      console.log(`  Request ${i + 1}: OK (${Date.now() - start}ms)`);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      const isRateLimit = errorMsg.includes("429") ||
                          errorMsg.includes("RESOURCE_EXHAUSTED") ||
                          errorMsg.includes("rate limit") ||
                          errorMsg.includes("quota");
      results.push({
        index: i + 1,
        success: false,
        latencyMs: Date.now() - start,
        error: isRateLimit ? "RATE_LIMITED" : errorMsg.slice(0, 50)
      });
      console.log(`  Request ${i + 1}: ${isRateLimit ? "RATE_LIMITED" : "FAILED"} (${Date.now() - start}ms)`);

      if (isRateLimit) {
        console.log(`  -> Rate limit hit at request ${i + 1}`);
        break;
      }
    }
  }

  const successCount = results.filter(r => r.success).length;
  const avgLatency = results.filter(r => r.success).reduce((sum, r) => sum + r.latencyMs, 0) / successCount || 0;

  console.log(`\nResults for ${modelName}:`);
  console.log(`  Successful: ${successCount}/${results.length}`);
  console.log(`  Avg latency: ${Math.round(avgLatency)}ms`);
  if (results.some(r => r.error === "RATE_LIMITED")) {
    console.log(`  Rate limit hit: YES`);
  }
}

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error("Error: GEMINI_API_KEY environment variable is required");
    console.error("Usage: GEMINI_API_KEY=your_key bun run scripts/experiment-label/test-gemini.ts");
    process.exit(1);
  }

  console.log("=== Gemini API Test ===\n");
  console.log(`API Key: ${apiKey.slice(0, 8)}...${apiKey.slice(-4)}`);

  const genAI = new GoogleGenerativeAI(apiKey);

  // Test 1: Check which models work
  console.log("\n--- Test 1: Model Availability ---\n");

  for (const modelName of MODELS_TO_TEST) {
    const result = await testModel(genAI, modelName);
    if (result.success) {
      console.log(`✓ ${modelName}: OK (${result.latencyMs}ms)`);
    } else {
      console.log(`✗ ${modelName}: FAILED`);
      console.log(`  Error: ${result.error?.slice(0, 100)}`);
    }
  }

  // Test 2: Rate limit test with working model
  console.log("\n--- Test 2: Rate Limit Test ---");

  // Find first working model
  for (const modelName of MODELS_TO_TEST) {
    const result = await testModel(genAI, modelName);
    if (result.success) {
      await testRateLimits(genAI, modelName, 5);
      break;
    }
  }

  console.log("\n=== Test Complete ===");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
