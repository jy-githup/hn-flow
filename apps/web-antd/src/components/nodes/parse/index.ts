import type { FlowNode } from "#/types/flow/index";
import component from "./index.vue";
import FormModel from "../llm/form/model.vue";
import FormInputParams from "../_base/form/input-params.vue";
import FormOutputParams from "../_base/form/output-params.vue";
import { SvgFlowParseIcon } from '@vben/icons';

export default (): FlowNode => {
	return {
		group: "扩展",
		label: "智能解析",
		description: "智能提取内容的关键信息",
    icon: SvgFlowParseIcon,
		color: "#fd9d2f",
		component,
		form: {
			items: [
				{
					label: "输入变量",
					prop: "inputParams",
					component: {
						vm: FormInputParams,
						props: {
							editField: false,
							disabled: true
						}
					}
				},
				{
					label: "模型",
					prop: "options.model",
					component: {
						vm: FormModel
					}
				},
				{
					label: "输出变量",
					prop: "outputParams",
					component: {
						vm: FormOutputParams,
						props: {
							typeInput: true,
							disabledFields: ["result"]
						}
					}
				}
			]
		},
		data: {
			options: {
				model: {
					options: [],
					params: {
						model: ""
					}
				}
			},
			inputParams: [
				{
					field: "text"
				}
			],
			outputParams: [
				{
					field: "result",
					type: "输入结果"
				}
			]
		},
		validator(data) {
			const { model } = data.options;

			// 验证变量是否绑定值
			const param = data.inputParams?.find((e) => !e.nodeId);
			if (param) {
				return `请绑定变量：${param.field}`;
			}

			// 验证模型是否选择
			if (!model.params.model) {
				return "请选择模型";
			}
		}
	};
};
