const fs = require('fs');
const mysql = require('mysql');
const puppeteer = require('puppeteer');
const Imap = require('imap');
const simpleParser = require('mailparser').simpleParser;
let aa="11111";

const imap = new Imap({
  user: 'danahibayhanh@hotmail.com',
  password: 'KeqOqD12',
  host: 'imap-mail.outlook.com',
  port: 993,
  tls: true
});

const codeStr = "";


const fileName = "order3805611";//插入数据的文件名
// 读取文件
const fileContent = fs.readFileSync('order/'+fileName+'.txt', 'utf8');
// 按行拆分内容
const lines = fileContent.split('\n');


// //设置静态资源目录public
// app.use(express.static(__dirname + '/public'));


//创建mysql数据库访问连接（数据库主机地址，用户名和密码，数据库名称根据情况自行修改）
const connection = mysql.createConnection({
	host: '49.235.252.234',
	user: 'tw',
	password: 'SmjffkjNPmJyjWZp',
	database: 'tw'
});

//连接数据库
connection.connect();

// 创建一个空数组，用于存储每行数据的对象

const main = () => {
  // 输出每一行
  let data = [];
  let count = 1;
  if(fileName !=""){
    for(let i=0;i<lines.length;i++){
      let line = lines[i];
      if (line.trim() !== '') {
        let arrayData = line.split(':');
        // 创建键值对对象
        //{name:'newman_vic776',password:'Zr0gYS33', proxy: '', like:0, keyword : 'CoinbaseExch', tag:'claim', twitterAddress:'', comments:'',first:true},
        
        connection.query('select * from  account where name="'+arrayData[0]+'"', function(error, results, fields){
          // if(empty(results)){
            if(results.length==0){
              connection.query('INSERT INTO account(name,password,mailName,mailPassword)VALUES("'+arrayData[0]+'","'+arrayData[1]+'","'+arrayData[2]+'","'+arrayData[3]+'")', function(error, results, fields){
                
              });
            }
        });
      }
    }
  }

  connection.query('select * from  account where first=1 ', function(error, results, fields){
    loginTW(results);
  });
}

const loginTW = async(results) => {
  for(let i = 0;i<results.length;i++){
    let item = results[i];

    let browser = await puppeteer.launch({ headless: false,
      // args: [
      //   '--proxy-server=192.168.1.25:30000',
      // ] ,
      userDataDir: '/path/'+item.name,
    });
    let page = await browser.newPage();

    await page.goto("https://twitter.com/home");
    await page.waitForTimeout(10000);

    console.log('Login account name1',item.name);
    // 检查用户是否已登录
    let loginButton = await page.$('input[autocomplete="username"]');

    // console.log('loginButton',loginButton);
    if (loginButton) {
      console.log('Login account name2',item.name);
      // await page.goto("https://twitter.com/i/flow/login");
      
      await page.type('input[autocomplete="username"]', item.name, { delay: 100 });

      page.click('div[class="css-18t94o4 css-1dbjc4n r-sdzlij r-1phboty r-rs99b7 r-ywje51 r-usiww2 r-2yi16 r-1qi8awa r-1ny4l3l r-ymttw5 r-o7ynqc r-6416eg r-lrvibr r-13qz1uu"]');

      
      await page.waitForSelector('input[autocomplete="current-password"]', { timeout: 50000 });

      await page.type('input[autocomplete="current-password"]', item.password, { delay: 100 });

      // await Promise.all([
        
      //   page.waitForNavigation(),
      // ]);

      page.click('div[class="css-18t94o4 css-1dbjc4n r-sdzlij r-1phboty r-rs99b7 r-19yznuf r-64el8z r-1ny4l3l r-1dye5f7 r-o7ynqc r-6416eg r-lrvibr"]');

      await page.waitForTimeout(10000);
      // await page.waitForSelector('div[data-testid="SideNav_AccountSwitcher_Button"]', { timeout: 30000 });
    }
    // imap = new Imap({
    //   user: item.mailName,
    //   password: item.mailPassword,
    //   host: 'imap-mail.outlook.com',
    //   port: 993,
    //   tls: true
    // });
    // 使用 IMAP 连接到电子邮件服务器
  const imap = new Imap({
    user: item.mailName,
    password: item.mailPassword,
    host: 'imap-mail.outlook.com',
    port: 993,
    tls: true
  });

  imap.once('ready', function () {
    // 选择收件箱
    imap.openBox('INBOX', true, function (err, box) {
      if (err) throw err;

      const fetchOptions = { bodies: ['TEXT'] };
      const searchCriteria = ['UNSEEN', ['FROM', 'info@twitter.com']];

      imap.search(searchCriteria, (searchErr, results) => {
        if (searchErr) throw searchErr;
  
        const messageCount = results.length;

        // 获取最新的未读邮件
        const latestEmail = results[results.length - 1];
        
        console.log(`Found ${messageCount} unread message(s) from Twitter:`);

        const f = imap.fetch(latestEmail, fetchOptions);
        f.on('message', (msg, seqno) => {
          const messageParts = [];

          msg.on('body', (stream, info) => {
            const buffer = [];

            stream.on('data', (chunk) => {
              buffer.push(chunk);
            });

            stream.on('end', () => {
              const partBuffer = Buffer.concat(buffer);
              messageParts.push({ partId: info.which, body: partBuffer });
            });
          });

          msg.once('end', async () => {
            const parsedMessage = await parseMessageParts(messageParts);
            // fs.writeFileSync('verification/verification.txt', JSON.stringify(parsedMessage), 'utf8');
            // fs.WriteStream()
            var codestr = "";
            if(parsedMessage.length>0)
              codestr = parsedMessage[parsedMessage.length-1]
            // console.log('extractVerificationCode----7777',codestr.text);
            const verificationCode = extractVerificationCode(codestr.text);
            // codeStr = verificationCode;
            console.log('Message:');
            // console.log(codestr.text);
            console.log('Verification Code:', verificationCode);
            console.log('---');

            // 填写验证码
            await page.type('input[autocomplete="on"]', verificationCode, { delay: 100 });
            page.click('div[data-testid="ocfEnterTextNextButton"]');
            await page.waitForSelector('div[data-testid="SideNav_AccountSwitcher_Button"]', { timeout: 30000 });

            connection.query('update account set first = 0 where name="'+item.name+'"', function(error, results, fields){
              
            });

            // 关闭浏览器
            await browser.close();

          });
        });
      });
    });
  });

  imap.once('error', function (err) {
    console.error(err);
  });

  imap.once('end', function () {
    console.log('IMAP connection ended.');
  });

  // 连接 IMAP 服务器
  imap.connect();
    
  }
}


const parseMessageParts = async (parts) => {
  const parsedParts = [];

  for (const part of parts) {
    const parsedPart = await simpleParser(part.body);
    parsedParts.push(parsedPart);
  }

  return parsedParts;
};

const extractVerificationCode = (text) => {
  const pattern = /\n(\w{8})\n/; // 假设验证码为6位数字 yf7ihnk5
  const matches = text.match(pattern);
  // console.log("matches",matches)
  if (matches && matches.length > 1) {
    return matches[1];
  }

  return null;
};


main();