import DataURIParser from "datauri/parser.js";
import path from 'path'
const getDateUri = (file) => {

  const parser = new DataURIParser();
  console.log(file);
  const extName = path.extname(file.originalname).toString();
    return parser.format(extName,file.buffer);

    
}


export default getDateUri;