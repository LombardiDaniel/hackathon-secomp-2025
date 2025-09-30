package services

// EmailService defines the interface for email-related operations.
// It provides methods for sending various types of emails, such as
// email confirmations, account creation notifications, organization
// invites, password reset emails, and payment acceptance notifications.
type EmailService interface {
	// SendAccountCreated notifies a user that their account has been created.
	SendAccountCreated(email string, name string) error

	SendReminder(email string, roadmapName string, roadmapId string) error
}

type EmailServiceMock struct{}

func (s *EmailServiceMock) SendAccountCreated(email string, name string) error {
	return nil
}
func (s *EmailServiceMock) SendReminder(email string, roadmapName string, roadmapId string) error {
	return nil
}
