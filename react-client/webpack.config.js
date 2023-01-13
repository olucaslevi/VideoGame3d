const path = require('path');  
const HtmlWebpackPlugin = require('html-webpack-plugin');  
  
module.exports = {  
   entry: './index.js',  
   output: {  
      path: path.join(__dirname, '/bundle'),  
      filename: 'index_bundle.js'  
   },  
   devServer: {
    static: path.resolve(__dirname, 'dist'),
    port: 3001
},
   module: {  
      rules: [  
         {  
            test: /\.jsx?$/,  
            exclude: /node_modules/,  
        use: {  
              loader: "babel-loader",  
            }  
         }  
      ]  
   },  
   plugins: [
      new HtmlWebpackPlugin({
        title: "Your custom title",
        template: './src/index.html'
      })
  ],
}  