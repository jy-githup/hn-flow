// import { ctx } from 'virtual:ctx';
const ctx = {};

const Java = {
  base: `import java.util.Map;
/**
 * 代码执行
 */
public class DynamicClass {
    /**
     * 主函数
     */
    public Map<String, Object> main(Map<String, Object> params) {
        System.out.println("Cool main " + params);
        return params;
    }
}`,
};

const Node = {
  base: `import axios from 'axios';
import * as _ from 'lodash';
import * as moment from 'moment';

/**
 * 代码执行
 */
export class Cool extends Base {
	/**
	 * 主函数
	 */
	async main(params: Params): Promise<Result> {
		console.log('Cool main', params);
		return {
			result: ""
		};
	}
}`,
  simple: `async function main(params: Params): Promise<Params> {
	return params;
}`,
};

export const Snippets = {
  Java,
  Node,
};

export const Snippet = Snippets[ctx.serviceLang];
