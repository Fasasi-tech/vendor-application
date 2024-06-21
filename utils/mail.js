
// exports.plainEmailTemplate = (heading, message) =>{
//     return `
//     <DOCTYPE html>
//     <html lang="en">
//     <head>
//     <meta charset="UTF-8">
//     <meta http-equiv="Content-Type" content="text/html charset=UTF-8" />
//     <style>
//     @media only screen and (max-width:620px){
//         h1{
//             fint-size: 20px;
//             padding:5px;
//         }
//     }
//     </style>
//     </head>
//         <body> 
//         <div>
//         <div style="max-width:620px; margin: 0 auto; font-family: sans-serif; color: #272727;">
//             <h1 style=" background: #f6f6f6; padding:10px; text-align: center; color: #272727;"> ${heading}</h1>
//             <p style="color: #272727; text-align: center;">${message}</p>
//         </div>
//     </div>
//     </body>
// </html> 
//     `;
// }          
exports.plainEmailTemplate = (heading, message) => {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Template</title>
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    font-family: Arial, sans-serif;
                    font-size: 16px;
                    line-height: 1.6;
                    color: #333;
                }
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                    background-color: #f9f9f9;
                }
                h1 {
                    font-size: 24px;
                    color: #000;
                    margin: 0 0 20px;
                    text-align: center;
                }
                p {
                    margin: 0 0 20px;
                }
                .signature {
                    margin-top: 20px;
                    font-style: italic;
                    color: #666;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>${heading}</h1>
                <p>${message}</p>
                <p class="signature">Best Regards,<br> BNSL</p>
            </div>
        </body>
        </html>
    `;
};

exports.generatePasswordResetTemplate = url =>{
    return `
    <DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html charset=UTF-8" />
    <style>
    @media only screen and (max-width:620px){
        h1{
            fint-size: 20px;
            padding:5px;
        }
    }
    </style>
    </head>
        <body> 
        <div>
        <div style="max-width:620px; margin: 0 auto; font-family: sans-serif; color: #272727;">
            <h1 style=" background: #f6f6f6; padding:10px; text-align: center; color: #272727;"> Response to Your Reset Password Request</h1>
            <p style="color: #272727; text-align: center;">Please click the link below to reset your password</p>
            <div style="text-align:center;">
                <a href="${url}" style = "font-family:sans-serif; margin:0 auto; padding:20px; text-align:center; background: #e63946; border-radius:5px; font-size:20px 10px; color:#fff; cursor:pointer; text-decoration:none; display:inline-block;" >
                    Reset Password
                </a>
            </div>
        </div>
    </div>
    </body>
</html> 

    `
}

exports.generateRfqEmail = (emailrfq) => {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Template</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #f6f6f6;
                }
                .container {
                    max-width: 600px;
                    margin: 20px auto;
                    padding: 20px;
                    background-color: #ffffff;
                    border: 1px solid #dddddd;
                    border-radius: 5px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                }
                table, th, td {
                    border: 1px solid #dddddd;
                }
                th, td {
                    padding: 10px;
                    text-align: left;
                }
                th {
                    background-color: #f2f2f2;
                }
                p {
                    margin: 10px 0;
                }
                .image-container {
                    text-align: center;
                }
                .image-container img {
                    max-width: 100%;
                    height: auto;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <table>
                    <tr>
                        <th>Product</th>
                        <td>${emailrfq.product}</td>
                    </tr>
                    <tr>
                        <th>Quantity</th>
                        <td>${emailrfq.quantity}</td>
                    </tr>
                    <tr>
                        <th>Buyer</th>
                        <td>${emailrfq.buyer}</td>
                    </tr>
                    <tr>
                        <th>Additional Info</th>
                        <td>${emailrfq.additionalInfo}</td>
                    </tr>
                    <tr>
                        <th>Status</th>
                        <td>Pending</td>
                    </tr>
                </table>
            </div>
        </body>
        </html>
    `;
}
