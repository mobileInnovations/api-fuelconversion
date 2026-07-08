function printRouter(basePath, router) {
  if (!router.stack) return;

  router.stack.forEach((layer) => {
    if (!layer.route) return;

    const methods = Object.keys(layer.route.methods)
      .map((m) => m.toUpperCase())
      .join(", ")
      .padEnd(8);

    console.log(`${methods} ${basePath}${layer.route.path}`);
  });
}

module.exports = printRouter;
