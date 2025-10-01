package services_test

import (
	"context"
	"testing"

	"github.com/LombardiDaniel/hackathon-secomp-2025/backend/src/internal/services"
)

func TestGenServiceImpl_GenerateRoadmap(t *testing.T) {
	tests := []struct {
		name string // description of this test case
		// Named input parameters for target function.
		prompt  string
		wantErr bool
	}{
		{
			name:    "oi",
			prompt:  "quero virar um devops engineer",
			wantErr: false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			g := services.GenServiceImpl{
				AppPyURL: "https://genservice.roady.patos.dev/",
			}
			got, gotErr := g.GenerateRoadmap(context.Background(), tt.prompt)
			if gotErr != nil {
				if !tt.wantErr {
					t.Errorf("GenerateRoadmap() failed: %v", gotErr)
				}
				return
			}
			if tt.wantErr {
				t.Fatal("GenerateRoadmap() succeeded unexpectedly")
			}
			t.Errorf("GenerateRoadmap() = %v", got)
		})
	}
}
