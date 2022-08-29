import { cp, mkdir } from 'shelljs';

cp('-R', 'src/public/css', 'dist/public');
mkdir('-p', 'dist/public/uploads/images');
mkdir('-p', 'dist/public/uploads/invoices');
