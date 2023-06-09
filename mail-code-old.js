require('dotenv').config();
const Imap = require('imap');
const simpleParser = require('mailparser').simpleParser;
const fs = require('fs');


const imap = new Imap({
  user: 'danahibayhanh@hotmail.com',
  password: 'KeqOqD12',
  host: 'imap-mail.outlook.com',
  port: 993,
  tls: true
});

const openInbox = (cb) => {
  imap.openBox('INBOX', true, cb);
};

const searchAndFetchEmails = () => {
  openInbox((err, box) => {
    if (err) throw err;

    const fetchOptions = { bodies: ['TEXT'] };
    const searchCriteria = ['UNSEEN', ['FROM', 'info@twitter.com']];
    // const searchCriteria = ['FROM "no-reply@twitter.com" UNSEEN']; // 可根据需要更改搜索条件

    imap.search(searchCriteria, (searchErr, results) => {
      if (searchErr) throw searchErr;

      const messageCount = results.length;

      if (messageCount > 0) {
        console.log(`Found ${messageCount} unread message(s) from Twitter:`);

        const f = imap.fetch(results, fetchOptions);
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
            console.log('extractVerificationCode----7777',codestr.text);
            const verificationCode = extractVerificationCode(codestr.text);

            console.log('Message:');
            console.log(codestr.text);
            console.log('Verification Code:', verificationCode);
            console.log('---');
          });
        });

        f.once('error', (fetchErr) => {
          console.error('Fetch error:', fetchErr);
          imap.end();
        });

        f.once('end', () => {
          console.log('All messages fetched.');
          imap.end();
        });
      } else {
        console.log('No unread messages from Twitter found.');
        imap.end();
      }
    });
  });
};

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
  console.log("matches",matches)
  if (matches && matches.length > 1) {
    return matches[1];
  }

  return null;
};

const main = () => {
  imap.connect();

  imap.once('ready', () => {
    searchAndFetchEmails();
  });

  imap.once('error', (err) => {
    console.error('IMAP error:', err);
  });

  imap.once('end', () => {
    console.log('IMAP connection ended.');
  });
};

main();
