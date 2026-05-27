<script setup>
import { onMounted, ref } from "vue";
import { withBase } from "vitepress";

const swaggerRoot = ref(null);

onMounted(async () => {
  const [{ default: SwaggerUI }] = await Promise.all([
    import("swagger-ui-dist/swagger-ui-es-bundle.js"),
    import("swagger-ui-dist/swagger-ui.css"),
  ]);

  SwaggerUI({
    url: withBase("/openapi.yaml"),
    domNode: swaggerRoot.value,
    deepLinking: true,
    tryItOutEnabled: true,
    displayOperationId: false,
    defaultModelsExpandDepth: 1,
  });
});
</script>

<template>
  <div ref="swaggerRoot" class="swagger-root" />
</template>

<style scoped>
.swagger-root {
  min-height: 720px;
}
</style>
