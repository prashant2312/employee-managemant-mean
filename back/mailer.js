var nodemailer = require('nodemailer');

const sendmail=(receiver,message,subject)=>{
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
  subject: 'Welcome to employee management',
  html: `
  <h4>Hello ${message},<h4>
          <p>Welcome to employee management system.<p>
  `,
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});
}
module.exports=sendmail