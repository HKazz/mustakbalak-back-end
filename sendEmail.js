const nodemailer = require('nodemailer');


function sendEmail(reciever,token){
    const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.email,
    pass: process.env.email_password
  }
});

const mailOptions = {
  from: process.env.email,
  to: reciever,
  subject: 'Sending Email using Node.js',
  text: `Your token is ${token}`
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});

}


module.exports = sendEmail
