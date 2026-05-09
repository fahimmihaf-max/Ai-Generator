"use client";
import { useState, useEffect } from 'react';

export default function AIApp() {
  const [prompt, setPrompt] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, generating, ready
  const [progress, setProgress] = useState(0);
  const [outputImage, setOutputImage] = useState(null);
  const [generator, setGenerator] = useState(null);

  // Load the model into the browser's WebGPU memory
  const loadAI = async () => {
    setStatus("loading");
    const { pipeline } = await import('@huggingface/transformers');

    try {
      const pipe = await pipeline('text-to-image', 'onnx-community/flux.1-schnell-onnx', {
        device: 'webgpu', // Uses user's GPU for $0 cost
        dtype: 'fp16',    // Faster, high quality
        progress_callback: (p) => {
          if (p.status === 'downloading') setProgress(Math.round(p.progress || 0));
        }
      });
      setGenerator(() => pipe);
      setStatus("ready");
    } catch (e) {
      alert("WebGPU not supported on this browser. Try Chrome/Edge 2025+");
      setStatus("idle");
    }
  };

  // Generate Image locally
  const generate = async () => {
    if (!generator) return;
    setStatus("generating");
    
    const result = await generator(prompt, {
      num_inference_steps: 4, // Flux-schnell needs only 4 steps
      width: 512,
      height: 512,
    });

    setOutputImage(result.images[0]);
    setStatus("ready");
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-10">
      <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
        Local AI Generator
      </h1>

      {status === "idle" && (
        <button onClick={loadAI} className="bg-white text-black px-8 py-3 rounded-full font-bold">
          Initialize AI Engine ($0 Cost)
        </button>
      )}

      {status === "loading" && (
        <div className="w-64 bg-gray-800 h-2 rounded-full">
          <div className="bg-blue-500 h-full rounded-full" style={{ width: `${progress}%` }}></div>
          <p className="text-center mt-2 text-sm">Downloading Model: {progress}%</p>
        </div>
      )}

      {(status === "ready" || status === "generating") && (
        <div className="w-full max-w-md">
          <textarea 
            className="w-full bg-gray-900 p-4 rounded-xl border border-gray-700"
            placeholder="Describe a product..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button 
            onClick={generate} 
            disabled={status === "generating"}
            className="w-full mt-4 bg-purple-600 py-3 rounded-xl font-bold"
          >
            {status === "generating" ? "Generating Locally..." : "Generate Image"}
          </button>
        </div>
      )}

      {outputImage && (
        <img src={outputImage} alt="Generated AI" className="mt-10 rounded-2xl shadow-2xl border border-gray-800 max-w-lg" />
      )}
    </div>
  );
}