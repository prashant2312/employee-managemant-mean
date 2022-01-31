var nodemailer = require('nodemailer');

const passwordMail=(receiver,message,subject,firstName)=>{
var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'avni730joshi@gmail.com',
    pass: '893798pj@joshi'
  }
});

var mailOptions = {
  from: 'avni730joshi@gmail.com',
  to: `${receiver}`,
  subject: `${subject}`,
  text: `
  Hello ${firstName},
        your password for employee management system is ${message}
  `
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});
}
module.exports=passwordMail