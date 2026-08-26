import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    mode: "production",

    target: "node",

    entry: "./src/server.ts",

    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "server.js",
        clean: true,
    },

    resolve: {
        extensions: [".ts", ".js"],
    },

    module: {
        rules: [
            {
                test: /\.ts$/,
                exclude: /node_modules/,
                use: "ts-loader",
            },
        ],
    },

    externalsPresets: {
        node: true,
    },
};