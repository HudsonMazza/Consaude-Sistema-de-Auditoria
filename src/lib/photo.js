// Movido de auditoria-medica.jsx sem alteração de comportamento.
// Redimensiona e recorta (cover) a imagem para um quadrado, devolvendo um data
// URL JPEG pequeno o suficiente para caber no documento do Firestore. Toda a
// conversão acontece no navegador — o arquivo original nunca sai da máquina.
export function lerFotoRedimensionada(file, size = 256, quality = 0.85) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) return reject(new Error('Selecione um arquivo de imagem.'));
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Não foi possível ler o arquivo.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Imagem inválida ou corrompida.'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = size;
        const ctx = canvas.getContext('2d');
        // JPEG não tem transparência: sem um fundo, as áreas transparentes (PNG) ficariam pretas
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);
        const escala = Math.max(size / img.width, size / img.height);
        const w = img.width * escala, h = img.height * escala;
        ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
