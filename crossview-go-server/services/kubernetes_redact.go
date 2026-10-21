package services

const redactedValue = "<redacted>"

// Keeps the key names, so a Secret still shows what it holds, but never the values.
func redactSecret(secret map[string]interface{}) {
	for _, field := range []string{"data", "stringData"} {
		if values, ok := secret[field].(map[string]interface{}); ok {
			for key := range values {
				values[key] = redactedValue
			}
		}
	}
	// kubectl apply stores the whole object, values included, in this annotation.
	if meta, ok := secret["metadata"].(map[string]interface{}); ok {
		if annotations, ok := meta["annotations"].(map[string]interface{}); ok {
			if _, found := annotations["kubectl.kubernetes.io/last-applied-configuration"]; found {
				annotations["kubectl.kubernetes.io/last-applied-configuration"] = redactedValue
			}
		}
	}
}
