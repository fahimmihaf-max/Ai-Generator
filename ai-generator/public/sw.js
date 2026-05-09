self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('ai-models').then((cache) => {
      // Pre-fetch the model files in the background
      return cache.addAll([
        'https://huggingface.co/onnx-community/flux.1-schnell-onnx/resolve/main/transformer/model.onnx',
        'https://huggingface.co/onnx-community/flux.1-schnell-onnx/resolve/main/vae_decoder/model.onnx'
      ]);
    })
  );
});