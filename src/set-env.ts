import {join} from 'path';
import * as fs from "node:fs";

const targetPath = join(__dirname, 'environments', 'environment.prod.ts');
console.log('Generating environment.prod.ts...');

const envConfigFile = `export const environment = {
production: true,
firebase: {
apiKey: '${process.env['firebase_apiKey']}′,
authDomain:′${process.env['firebase_authDomain']}',
projectId: '${process.env['firebase_projectId']}′,
storageBucket: ′${process.env['firebase_storageBucket']}',
messagingSenderId: '${process.env['firebase_messagingSenderId']}′,
appId:′${process.env['firebase_appId']}',
measurementId: '${process.env['firebase_measurementId']}'
}
};
`;

fs.writeFileSync(targetPath, envConfigFile);
console.log(`The file 'environment.prod.ts' has been written successfully to ${targetPath}`);
