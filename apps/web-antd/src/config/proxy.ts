export const proxy = {
	"/dev/": {
		target: "https://hpay.jyoou.com/agent",
		// target: "http://192.168.8.50:8001",
		changeOrigin: true,
		rewrite: (path: string) => path.replace(/^\/dev/, "")
	},
	"/prod/": {
		target: "https://hpay.jyoou.com/agent",
		changeOrigin: true,
		rewrite: (path: string) => path.replace(/^\/prod/, "/agent")
	}
};
