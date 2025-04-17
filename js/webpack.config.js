/*
 * Copyright (C) 2019-2024 CZ.NIC z.s.p.o. (https://www.nic.cz/)
 *
 * This is free software, licensed under the GNU General Public License v3.
 * See /LICENSE for more information.
 */

const path = require("path");

const webpack = require("webpack");

module.exports = () => ({
    mode: "development",
    entry: "./src/app.js",
    output: {
        filename: "app.min.js",
        path: path.join(__dirname, "../reforis_static/reforis_diagnostics/js/"),
    },
    resolve: {
        modules: [
            path.resolve(__dirname, "./src"),
            path.resolve(__dirname, "./node_modules"),
        ],
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules\/(?!foris)/,
                loader: "babel-loader",
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"],
            },
        ],
    },
    plugins: [
        new webpack.ProvidePlugin({
            process: "process/browser.js",
        }),
    ],
    // Equal to peerDependencies in package.json
    externals: {
        "prop-types": "PropTypes",
        react: "React",
        "react-dom": "ReactDOM",
        "react-router-dom": "ReactRouterDOM",
    },
});
