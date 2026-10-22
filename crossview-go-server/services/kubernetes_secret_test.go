package services

import "testing"

func TestSecretMetadataOnly_KeepsOnlyMetadata(t *testing.T) {
	secret := map[string]interface{}{
		"apiVersion": "v1",
		"kind":       "Secret",
		"type":       "Opaque",
		"data":       map[string]interface{}{"client-secret": "c2VjcmV0"},
		"stringData": map[string]interface{}{"token": "plain"},
		"metadata": map[string]interface{}{
			"name":      "oidc",
			"namespace": "auth",
			"labels":    map[string]interface{}{"app": "x"},
			"annotations": map[string]interface{}{
				"kubectl.kubernetes.io/last-applied-configuration": `{"data":{"client-secret":"c2VjcmV0"}}`,
			},
			"managedFields": []interface{}{"f:data"},
		},
	}

	got := SecretMetadataOnly(secret)

	for _, field := range []string{"data", "stringData"} {
		if _, found := got[field]; found {
			t.Errorf("%s must not be returned, got %v", field, got)
		}
	}
	meta := got["metadata"].(map[string]interface{})
	for _, field := range []string{"annotations", "managedFields"} {
		if _, found := meta[field]; found {
			t.Errorf("metadata.%s must not be returned, got %v", field, meta)
		}
	}
	if got["kind"] != "Secret" || got["type"] != "Opaque" || meta["name"] != "oidc" || meta["namespace"] != "auth" {
		t.Errorf("expected kind, type, name and namespace kept, got %v", got)
	}
}

func TestSecretMetadataOnly_UnknownFieldsAreDropped(t *testing.T) {
	got := SecretMetadataOnly(map[string]interface{}{"somethingNew": "value", "metadata": map[string]interface{}{"name": "a", "extra": "x"}})
	if _, found := got["somethingNew"]; found {
		t.Errorf("unknown top-level field leaked: %v", got)
	}
	if _, found := got["metadata"].(map[string]interface{})["extra"]; found {
		t.Errorf("unknown metadata field leaked: %v", got)
	}
}

func TestSecretMetadataOnly_EmptyIsFine(t *testing.T) {
	if got := SecretMetadataOnly(map[string]interface{}{}); len(got) != 0 {
		t.Errorf("expected an empty result, got %v", got)
	}
}
