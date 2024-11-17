const { Storage } = require('@google-cloud/storage');
const { format } = require('util');
const env = require('../config/env');
const url = require('url');
const { v4: uuidv4 } = require('uuid');
const uuid = uuidv4();

const storage = new Storage({
    projectId: "eatsunach",
    keyFilename: './serviceAccountKey.json'
});

const bucket = storage.bucket("gs://eatsunach.firebasestorage.app/");

/**
 * Subir el archivo a Firebase Storage
 * @param {File} file Objeto que será almacenado en Firebase Storage
 */
module.exports = (file, pathImage, deletePathImage) => {
    return new Promise((resolve, reject) => {
        
        console.log('Delete path:', deletePathImage);
        if (deletePathImage) {
            if (deletePathImage != null || deletePathImage != undefined) {
                const parseDeletePathImage = url.parse(deletePathImage);
                const urlDelete = parseDeletePathImage.pathname.slice(23);
                const fileDelete = bucket.file(urlDelete);

                fileDelete.delete().then(() => {
                    console.log('Imagen eliminada con éxito');
                }).catch(err => {
                    console.log('Error al eliminar la foto:', err);
                });
            }
        }

        if (pathImage) {
            if (pathImage != null || pathImage != undefined) {
                
                const fileUpload = bucket.file(pathImage);
                const blobStream = fileUpload.createWriteStream({
                    metadata: {
                        contentType: 'image/png',
                        metadata: {
                            firebaseStorageDownloadTokens: uuid,
                        }
                    },
                    resumable: false
                });

                blobStream.on('error', (error) => {
                    console.log('Error al subir archivo a Firebase:', error);
                    reject('Something is wrong! Unable to upload at the moment.');
                });

                blobStream.on('finish', () => {
                    // La URL pública puede usarse para acceder directamente al archivo vía HTTP
                    const url = format(`https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${fileUpload.name}?alt=media&token=${uuid}`);
                    console.log('URL de Cloud Storage:', url);
                    resolve(url);
                });

                // Envía el contenido del archivo al flujo
                blobStream.end(file.buffer);
            }
        }
    });
};
