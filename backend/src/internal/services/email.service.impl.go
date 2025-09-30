package services

import (
	"bytes"
	"errors"
	"path/filepath"
	"text/template"

	"github.com/LombardiDaniel/hackathon-secomp-2025/backend/src/pkg/constants"
	"github.com/LombardiDaniel/hackathon-secomp-2025/backend/src/pkg/it"

	"github.com/resend/resend-go/v2"
)

var errResend = errors.New("could not send email via resend")

type EmailServiceResendImpl struct {
	resendClient *resend.Client

	emailConfirmationTemplate *template.Template
	accountCreationTemplate   *template.Template
	reminderTemplate          *template.Template
}

func NewEmailServiceResendImpl(resendApiKey string, templatesDir string) EmailService {
	return &EmailServiceResendImpl{
		resendClient:            resend.NewClient(resendApiKey),
		accountCreationTemplate: it.Must(template.ParseFiles(filepath.Join(templatesDir, "account-created.html"))),
		reminderTemplate:        it.Must(template.ParseFiles(filepath.Join(templatesDir, "reminder.html"))),
	}
}

type htmlAccountCreatedVars struct {
	FirstName string
}

func (s *EmailServiceResendImpl) SendAccountCreated(email string, name string) error {
	body := new(bytes.Buffer)
	err := s.accountCreationTemplate.Execute(body, htmlAccountCreatedVars{
		FirstName: name,
	})
	if err != nil {
		return errors.Join(err, errors.New("could not execute accountCreationTemplate"))
	}

	params := &resend.SendEmailRequest{
		From:    constants.NoreplyEmail,
		To:      []string{email},
		Subject: "Account Created!",
		Html:    body.String(),
	}

	_, err = s.resendClient.Emails.Send(params)
	return errors.Join(err, errResend)
}

type htmlReminderVars struct {
	Roadmap   string
	RoadmapId string
}

func (s *EmailServiceResendImpl) SendReminder(email string, roadmapName string, roadmapId string) error {
	body := new(bytes.Buffer)
	err := s.reminderTemplate.Execute(body, htmlReminderVars{
		Roadmap:   roadmapName,
		RoadmapId: roadmapId,
	})
	if err != nil {
		return errors.Join(err, errors.New("could not execute accountCreationTemplate"))
	}

	params := &resend.SendEmailRequest{
		From:    constants.NoreplyEmail,
		To:      []string{email},
		Subject: "Ei...cade você?",
		Html:    body.String(),
	}

	_, err = s.resendClient.Emails.Send(params)
	return errors.Join(err, errResend)
}
