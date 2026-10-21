package services

import "testing"

func TestRedactSecret_HidesValuesAndKeepsKeys(t *testing.T) {
	secret := map[string]interface{}{
		"data":       map[string]interface{}{"client-secret": "c2VjcmV0", "client-id": "aWQ="},
		"stringData": map[string]interface{}{"token": "plain"},
		"metadata": map[string]interface{}{
			"name": "oidc",
			"annotations": map[string]interface{}{
				"kubectl.kubernetes.io/last-applied-configuration": `{"data":{"client-secret":"c2VjcmV0"}}`,
				"other": "kept",
			},
		},
	}

	redactSecret(secret)

	data := secret["data"].(map[string]interface{})
	if len(data) != 2 || data["client-secret"] != redactedValue || data["client-id"] != redactedValue {
		t.Errorf("expected both keys kept with redacted values, got %v", data)
	}
	if secret["stringData"].(map[string]interface{})["token"] != redactedValue {
		t.Errorf("expected stringData redacted, got %v", secret["stringData"])
	}
	annotations := secret["metadata"].(map[string]interface{})["annotations"].(map[string]interface{})
	if annotations["kubectl.kubernetes.io/last-applied-configuration"] != redactedValue {
		t.Errorf("expected the last-applied annotation redacted, got %v", annotations)
	}
	if annotations["other"] != "kept" {
		t.Errorf("other annotations must stay, got %v", annotations)
	}
}

func TestRedactSecret_NoDataIsFine(t *testing.T) {
	redactSecret(map[string]interface{}{"metadata": map[string]interface{}{"name": "empty"}})
	redactSecret(map[string]interface{}{})
}
