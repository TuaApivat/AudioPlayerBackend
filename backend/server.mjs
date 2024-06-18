import express from "express";
import pg from 'pg';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import fs from 'node:fs';
import { parse } from 'csv-parse';

const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const rdirname = __dirname;
//console.log(path.join(rdirname,'public'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/api/static', express.static(__dirname + '/public'));

const client = new pg.Client({ user: 'postgres', host: 'localhost', database: 'audioplayerapp', password: 'master151', port: 5432,});
client.connect() .then(() => { console.log('Connected to PostgreSQL database!'); }) .catch((err) => { console.error('Error connecting to the database:', err); });

//multer section
const storagecon = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/musics')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.originalname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ storage: storagecon})

//storage for private csv file
const csvstorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploaded/csv')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.originalname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const csvupload = multer({ storage: csvstorage})
//=============

app.get('/', async (req, res) => {
  res.send('Welcome to my server!');
});

app.get('/api/static',async (req,res) => {
  res.send('Access Static');
});

app.post('/api/searchmusic', async (req, res) => {

  console.log('reqbody:' + req.body.mname);
  var statement = 'select * from music WHERE name LIKE ';
  statement += "'" + req.body.mname + "%" + "'";
  if(req.body.mname.length == 0)
    statement = 'select * from music limit 5';
  console.log(statement);
  var result = await client.query(statement);
  if(result.rows != null)
      res.status(200).json({'query':result.rows,'nq':1})
  else if(result.rows == null){
      res.status(200).json({'query':result.rows,'nq':-1})
  }
});

app.post('/api/fetchInList',async function (req, res) {
  
  var inputs = req.body.inputs;
  console.log(inputs);
  var inputlist = inputs.split(",");
  var statement = 'select * from music where ';
  let n=inputlist.length;
  for(let i=0; i<n; i++){
    statement += 'id= ';
    statement += inputlist[i];
    if(i != n-1)
      statement += ' or ';
  }
  var ret =  await client.query(statement);
  console.log(statement)
  if(ret != null){
     res.status(200).json({'result':'success','queryret':ret.rows})
  }
  
});


app.get('/api/getMusic',async function (req, res) {
  var statement = 'select * from music mu';

  var musictype = ''
  if(req.query.type){
     musictype = req.query.type;
  }
  if(musictype != ''){
     statement += ' where mu.type = ' + "'" + musictype + "'"
  }
  var ret =  await client.query(statement);
  console.log(statement)
  if(ret != null){
     res.status(200).json({'result':'success','queryret':ret.rows})
  }
});


//For dealing with csv
app.post('/api/uploadcsv',csvupload.single('csvFile'), async function (req, res, next) {
   
   if(req.file){
    
    let n=0;
    const rows = [];

    fs.createReadStream(req.file.path)
    .pipe(
      parse({
        delimiter: ",",
        columns: false, //true
        ltrim: true,
        relax_column_count: true,
      })
    )
    .on('data', (row) => {
         if(row.length != 7)
            res.status(200).json({'status':'Error read'});
         console.log(row[0]);
         if(n >= 1)
          rows.push(row);
        n++;
    })
    .on('end', () => {
        console.log('CSV file processing completed');
        //process insert command here
        var query = `INSERT INTO music (id,artistid,name,type,imgcoverurl,fileurl,info)
        VALUES ( `;

       for(let i=1; i<=rows.length*7; i++){
         query += '$';
         query += i;
         if(i != rows.length*7)
            query += ',';
       }
       query += ' )';
       console.log(query);
       /*
        // Insert all rows using a single query
        client.query(sql, [rows], (err, result) => {
          if (err) {
            console.error('Error inserting rows:', err);
          } else {
            console.log('Rows inserted successfully');
          }
        });
        */
    });
      
     res.status(200).json({'status':'success'});
   }
   else if(!req.file){
      res.status(200).json({'status':'error file not found'});
   }

});
//===================

app.post('/api/Music/upload',upload.fields([{ name: 'musicFile', maxCount: 1 }, { name: 'musicCover', maxCount: 1 }]), async function (req, res, next) {
  // req.files is array of `music` files
  // req.body will contain the text fields, if there were any
  if(req.body.fmode == 0){
    console.log(req.files['musicFile'][0])
    console.log(req.files['musicCover'][0])
  }

  //insert data to the database
  var statement = 'INSERT into music(name,info,type,fileurl,imgcoverurl) VALUES($1,$2,$3,$4,$5) RETURNING id';
  var musicFile = '';
  var musicCover = '';
  if(req.body.fmode == 1){
     musicFile = req.body.selectedMusic;
     musicCover = req.body.selectedCover;
  }
  else if(req.body.fmode == 0){
     musicFile = req.files['musicFile'][0].path;
     musicCover = req.files['musicCover'][0].path;
  }
 
  var queryret = await client.query(statement,[req.body.musicName,req.body.musicInfo,req.body.musicType,musicFile,musicCover])
  //===========================
  if(queryret != null){
    console.log('upload successfully');
    res.status(200).json({result:'success'});
  }
});

//update Data=========================
app.post('/api/updatedata', async function (req, res) {

  console.log('Updating.....');
  //insert data to the database
  var selid = req.body.selectedid;
  var statement = 'UPDATE music SET name = ' + '$1';
  statement += ',' + 'info=' + '$2';
  statement += ',' + 'type=' + '$3';
  statement += ',' + 'imgcoverurl=' + '$4';
  statement += ',' + 'fileurl=' + '$5';
  statement += ' WHERE id = '
  statement += selid;

  var musicFile = req.body.selectedMusic;
  var musicCover = req.body.selectedCover;
  console.log(statement);
  var queryret = await client.query(statement,[req.body.musicName,req.body.musicInfo,req.body.musicType,musicCover,musicFile])
  //===========================
  if(queryret != null){
    console.log('upload successfully');
    res.status(200).json({result:'success'});
  }
});


app.post('/api/delmudata', async function (req, res) {

  var ismultiple = false;
  if(req.body.delmode)
  {
    if(req.body.delmode == 'multiple')
       ismultiple = true;
  }
  if(!ismultiple){
      var selid = req.body.selectedid;
      var statement = 'DELETE FROM music WHERE id = $1';
      var queryret = await client.query(statement,[selid])
      //===========================
      if(queryret != null){
        console.log('delete successfully');
        res.status(200).json({result:'success'});
      }
  }
  else if(ismultiple){

    var promiseList = [];
    var statement = 'DELETE FROM music WHERE id = $1'
    var idlist = req.body.idlist.split(',');
    var n = idlist.length;

    for(let i=0; i<n; i++){

     const pp = new Promise((resolve, reject) => {

        client.query(statement,[idlist[i]])
        .then(res => {
            resolve(res)
        })
        .catch(err => {
            reject(err)
            console.error(err);
        })
    
     });
      promiseList.push(pp);
    }

    Promise.all([...promiseList]).then((values) => {
      if(values.length == n){
        res.status(200).json({'result':'success'});
      }
      else 
      {
        res.status(200).json({'result':'error'});
      }

    });

  }

});


app.post('/api/delmufile', async function (req, res) {

  var rfilepath = __dirname;
  if(!req.body.dellist){
      var selfile = req.body.selfile;
      fs.unlink(rfilepath+selfile, (err) => {
        if (err) {
          console.error(err);
          res.status(200).json({'state':err});
          return;
        }
        console.log('File deleted successfully');
        res.status(200).json({'state':'success'});
      });
  }
  else if(req.body.dellist){
     var filelist = req.body.dellist.split(',');
     let n = filelist.length;
     var promiseList = [];
     for(let i=0; i<n; i++){

      const pp = new Promise((resolve, reject) => {
        fs.unlink(rfilepath+filelist[i], (err) => {
          if (err) {
            console.error(err);
            return;
          }
          console.log('File deleted successfully');
          resolve('success');
        });
      });
       promiseList.push(pp);
     }

     Promise.all([...promiseList]).then((values) => {
          if(values.length == n){
            res.status(200).json({'state':'success'});
          }
          else 
          {
            res.status(200).json({'state':'error'});
          }
     });

  }
 
});
//====================================


//upload multiple files
app.post('/api/Music/multipleupload',upload.any('musics'), async function (req, res, next) {
  // req.files is array of `music` files
  // req.body will contain the text fields, if there were any
  if(req.files){
    console.log(req.files);
    console.log('upload successfully');
    res.status(200).json({result:'success'});
  }
  else {
    console.log('upload error');
    res.status(200).json({result:'upload error'});
  }
  
});
//=====================

//test function ======================
app.get('/api/getAllFiles',async function(req,res){
  var EXTENSION = '.mp3';
  if(req.query.ftype){
    if(req.query.ftype == 'icover')
      EXTENSION = '.png'
    else if(req.query.ftype == 'all'){
      EXTENSION = '.png|.mp3|.wav';
    }
  }
  var extensionls = EXTENSION.split('|');
  var nextension = extensionls.length;
  
  var folderPath = __dirname + '/public/musics';
  var storagepath = '/public/musics';
  console.log(folderPath);
  var filesname = [];
  
  if(nextension == 1){
    filesname = await fs.readdirSync(folderPath).filter(file => {
      return path.extname(file).toLowerCase() === EXTENSION;
    });
  }
  else if(nextension > 1){
    filesname = await fs.readdirSync(folderPath).filter(file => {
      let match = false;
      for(let i=0; i<nextension; i++){
        if(path.extname(file).toLowerCase() == extensionls[i]){
            match = true;
            break;
        }
      }
  
      return match === true;
    });
  }

  var filespath = filesname.map(fileName => {
    return path.join(storagepath,fileName);
  });
 
  console.log(filesname);
  res.status(200).json({'ret':{'filesname':filesname,'filespath':filespath},'state':'OK'});
});
//====================================

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
