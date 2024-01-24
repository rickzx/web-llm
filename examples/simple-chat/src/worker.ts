// Serve the chat workload through web worker
import { ChatWorkerHandler, ChatModule, LogitProcessor } from "@mlc-ai/web-llm";
import { MusicLogitProcessor } from "./music_logit_processor";

class MyLogitProcessor implements webllm.LogitProcessor {
  private tokenSequence: Array<number> = [];

  processLogits(logits: Float32Array): Float32Array {
    logits[0] = 100.0;  // should be enough so that we always sample token 0 below
    return logits;
  }

  processSampledToken(token: number): void {
    this.tokenSequence.push(token);
    console.log("processSampledToken: " + this.tokenSequence.length);
  }

  resetState(): void {
    this.tokenSequence = [];
    console.log("resetState");
  }
}

const tok0LogitProcessor = new MyLogitProcessor();
const musicLogitProcessor = new MusicLogitProcessor();
const logitProcessorRegistry = new Map<string, LogitProcessor>();

logitProcessorRegistry.set("music-medium-800k-q0f32", musicLogitProcessor);
logitProcessorRegistry.set("Phi2-q4f16_1", tok0LogitProcessor);

const chat = new ChatModule(logitProcessorRegistry);
const handler = new ChatWorkerHandler(chat);
self.onmessage = (msg: MessageEvent) => {
  handler.onmessage(msg);
};
