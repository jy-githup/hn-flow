import type { Upload } from '../types';

import { type AxiosProgressEvent } from 'axios';
import { ElMessage } from 'element-plus';
import { merge } from 'lodash-es';

import { module, service } from '#/cool';
import { uuid } from '#/cool/utils';
import { useBase } from '#/components/base';

import { pathJoin } from '../utils';

export function useUpload() {
  const { options } = module.get('upload');
  const { user } = useBase();

  // 上传
  async function toUpload(
    file: File,
    opts: Upload.Options = {},
  ): Promise<{
    fileId: string;
    key: string;
    url: string;
  }> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      // 合并配置
      const { prefixPath, onProgress } = merge(options, opts);

      // 文件id
      const fileId = uuid('');

      try {
        // 上传模式、类型
        const { mode, type } = await service.base.comm.uploadMode();

        // 本地上传
        const isLocal = mode === 'local';

        // 文件名
        const fileName = `${fileId}_${file.name}`;

        // Key
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        let key = isLocal ? fileName : pathJoin(prefixPath!, fileName);

        // 多种上传请求
        // 上传到云端
        async function next({
          host,
          preview,
          data,
        }: {
          data?: any;
          host: string;
          preview?: string;
        }) {
          const fd = new FormData();

          // key
          fd.append('key', key);

          // 签名数据
          for (const i in data) {
            if (!fd.has(i)) {
              fd.append(i, data[i]);
            }
          }

          // 文件
          fd.append('file', file);

          // 上传
          await service
            .request({
              url: host,
              method: 'POST',
              headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: isLocal ? user.token : null,
              },
              timeout: 600_000,
              data: fd,
              onUploadProgress(e: AxiosProgressEvent) {
                const progress = e.total
                  ? Math.floor((e.loaded / e.total) * 100)
                  : 0;

                onProgress?.(progress);
              },
              proxy: isLocal,
              NProgress: false,
            })
            .then((res) => {
              key = encodeURIComponent(key);

              let url = '';

              url = isLocal ? res : pathJoin(preview || host, key);

              resolve({
                key,
                url,
                fileId,
              });
            })
            .catch((error) => {
              ElMessage.error(error.message);
              reject(error);
            });
        }

        if (isLocal) {
          next({
            host: '/admin/base/comm/upload',
          });
        } else {
          service.base.comm
            .upload(
              type === 'aws'
                ? {
                    key,
                  }
                : {},
            )
            .then((res) => {
              switch (type) {
                // aws
                case 'aws': {
                  next({
                    host: res.url,
                    data: res.fields,
                  });
                  break;
                }
                // 腾讯
                case 'cos': {
                  next({
                    host: res.url,
                    data: res.credentials,
                  });
                  break;
                }
                // 阿里
                case 'oss': {
                  next({
                    host: res.host,
                    preview: res.publicDomain,
                    data: {
                      OSSAccessKeyId: res.OSSAccessKeyId,
                      policy: res.policy,
                      signature: res.signature,
                    },
                  });
                  break;
                }
                // 七牛
                case 'qiniu': {
                  next({
                    host: res.uploadUrl,
                    preview: res.publicDomain,
                    data: {
                      token: res.token,
                    },
                  });
                  break;
                }
              }
            })
            .catch(reject);
        }
      } catch (error) {
        ElMessage.error('文件上传失败');
        console.error('[upload]', error);
        reject(error);
      }
    });
  }

  return {
    options,
    toUpload,
  };
}
