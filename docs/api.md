<script setup>
import SwaggerUi from "./.vitepress/theme/components/SwaggerUi.vue";
</script>

# Swagger API Reference

This page renders `backend/docs/swagger.yaml` through Swagger UI. The VitePress scripts sync it to `docs/public/openapi.yaml` before `dev` and `build`.

<SwaggerUi />
