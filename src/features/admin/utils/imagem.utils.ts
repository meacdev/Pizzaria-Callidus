export function redimensionarEComprimir(
    arquivo: File,
    larguraMaxima: number,
    qualidade: number,
): Promise<string> {
    return new Promise((resolve, reject) => {
        const leitor = new FileReader();

        leitor.onload = () => {
            const img = new Image();

            img.onload = () => {
                const escala = Math.min(1, larguraMaxima / img.width);
                const largura = Math.round(img.width * escala);
                const altura = Math.round(img.height * escala);

                const canvas = document.createElement('canvas');
                canvas.width = largura;
                canvas.height = altura;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Não foi possível processar a imagem.'));
                    return;
                }

                ctx.drawImage(img, 0, 0, largura, altura);
                resolve(canvas.toDataURL('image/jpeg', qualidade));
            };

            img.onerror = () => reject(new Error('Arquivo de imagem inválido.'));
            img.src = leitor.result as string;
        };

        leitor.onerror = () => reject(new Error('Falha ao ler o arquivo.'));
        leitor.readAsDataURL(arquivo);
    });
}
