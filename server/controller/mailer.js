import nodemailer from "nodemailer";
import Mailgen from "mailgen";

import ENV from "../config.js";

//https://ethereal.email/create
let nodeConfig = {
  host: "smtp.ethereal.email",
  port: 587,
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: "janice.jaskolski76@ethereal.email", // generated ethereal user ENV.EMAIL
    pass: "xA2rw8T6ySM6SrEZ1R", // generated ethereal password ENV.PASSWORD
  },
  //tls: {
    //rejectUnauthorized: false,
  //},
};

let transporter = nodemailer.createTransport(nodeConfig);

let MailGenerator = new Mailgen({
  theme: "default",
  product: {
    name: "Mailgen",
    link: "https://mailgen.js/",
  },
});

/** POST: http://localhost:8080/api/register-mail 
 * @param: {
  "username" : "example123",
  "userEmail" : "admin123",
  "text" : "",
  "subject" : "",
}
*/
export const registerMail = async (req, res) => {
  const { username, userEmail, text, subject } = req.body;

  //body of the email
  try {
    let email = {
      body: {
        name: username,
        intro:
          text ||
          "Welcome to Winn App! We're very excited to have you on board.",
        outro:
          "Need help, or have questions? Just reply to this email, we'd love to help.",
      },
    };

    let emailBody = MailGenerator.generate(email);

    let message = {
      from: ENV.EMAIL,
      to: userEmail,
      subject: subject || "Signup SuccessFul",
      html: emailBody,
    };

    //to send mail
    transporter
      .sendMail(message)
      .then(() => {
        return res
          .status(201)
          .send({ message: "You should receive an email from us." });
      })
      .catch((error) => res.status(500).send({ error }));

  } catch (error) {
    console.error("Error in registerMail mailer", error);
    return res.status(500).send(error);
  }
};
