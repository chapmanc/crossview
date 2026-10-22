package services

// A Secret is returned as metadata only, with no values, key names or annotations.
// It lists what is allowed, so a field nobody thought of can never leak.
func SecretMetadataOnly(secret map[string]interface{}) map[string]interface{} {
	safe := map[string]interface{}{}
	for _, field := range []string{"apiVersion", "kind", "type"} {
		if value, ok := secret[field]; ok {
			safe[field] = value
		}
	}
	if meta, ok := secret["metadata"].(map[string]interface{}); ok {
		safeMeta := map[string]interface{}{}
		for _, field := range []string{"name", "namespace", "labels", "creationTimestamp", "ownerReferences"} {
			if value, ok := meta[field]; ok {
				safeMeta[field] = value
			}
		}
		safe["metadata"] = safeMeta
	}
	return safe
}
