import fs from 'fs';
import path from 'path';

const deleteFile = (filePath: string) => {
  fs.unlink(path.join('dist', 'public', filePath), error => {
    if (error) throw error;
  });
};

export { deleteFile };
