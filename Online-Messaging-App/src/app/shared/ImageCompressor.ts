import { Renderer2 } from "@angular/core";
import { Constants } from "./app-config";

const CANVAS = "canvas";
const TWO_D = "2d";
const IMAGE_DELIMITER = ";";
const COMMA = ",";

export class ImageCompressor {
    public static compressImage(image: File, width, height, render: Renderer2): Promise<File> {
        return new Promise<File>((resolve, reject) => {
            let extension = image.name.split(Constants.DOT)[1].toLowerCase();

            if (Constants.PNG == extension.toLowerCase() || Constants.JPG == extension.toLowerCase() || Constants.JPEG == extension.toLowerCase()) {
                const canvas: HTMLCanvasElement = render.createElement(CANVAS);
                const ctx: CanvasRenderingContext2D = canvas.getContext(TWO_D);

                canvas.width = width;
                canvas.height = height;

                let fileReader: FileReader = new FileReader();
                fileReader.readAsDataURL(image);
                fileReader.onloadend = () => {
                    let imageData = fileReader.result as string;

                    let img = new Image();

                    img.onload = () => {
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.width);

                        let mime = imageData.substring(5, imageData.split(IMAGE_DELIMITER)[0].length - 5);
                        const file = new File([this.convertImageDateToBlob(canvas.toDataURL(mime, 100))], image.name, {
                            type: `image/${extension}`
                        });

                        resolve(file);
                    };

                    img.src = imageData;
                };
            } else {
                reject("Incorrect file type");
            }
        });
    }

    static convertImageDateToBlob(imageData): Blob {
        const arr = imageData.split(COMMA);
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);

        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }

        return new Blob([u8arr], { type: mime });
    }
}
