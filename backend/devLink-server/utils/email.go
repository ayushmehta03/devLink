package utils

import (
	"fmt"
	"net/smtp"
	"os"
)



func SendOTPEmail(toEmail string,otp string) error{

	from:=os.Getenv("EMAIL_FROM")

	password:=os.Getenv("EMAIL_PASSWORD")

	if from==""||password==""{
		return fmt.Errorf("email credentials not sent")
	}

	smtpHost:="smtp.gmail.com"
	smtpPort:="587"


	message := []byte(
		"Subject: DevLink OTP Verification\r\n" +
			"\r\n" +
			"Your OTP for DevLink is: " + otp + "\r\n" +
			"This OTP is valid for 10 minutes.\r\n",
	)


	auth:=smtp.PlainAuth("",from,password,smtpHost)


	err:=smtp.SendMail(
		smtpHost+":"+smtpPort,
		auth,
		from,
		[]string{toEmail},
		message,
	)

	return err
}