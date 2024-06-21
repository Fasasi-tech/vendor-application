const nodemailer = require("nodemailer")

exports.sendEmail = async (subject, message, sent_to, sent_from, reply_to, attachments=[])=>{
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      port: 2525,
        secure:false,
        auth: {
            user:"fasasiayinde98@gmail.com",
            pass: "durbyygrirwxvbmc",
        },
    // tls: {
    //     rejectUnauthorized: false,
    // }   
})
    const options = {
        from: sent_from,
        to: sent_to,
        replyTo: reply_to,
        subject: subject,
        html: message,
        attachments:attachments

    }

    // send Email
    transporter.sendMail(options, function(err, info) {
        if (err){
            console.log(err)
        } else {
            console.log(info)
        }
    })
}
//module.exports = sendEmailss
