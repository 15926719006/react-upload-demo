import { UploadResult } from "../manager/upload-manager"
/** 模拟上传请求 */
export const _UploadRequest = (id: string): Promise<UploadResult> => {
  // 随机成功或失败
  const random = generateRandomNumber()
  return new Promise((resolve)=> {
    console.log('上传');
    if(random === 1) {
      resolve(UploadResult.SUCCESS)
    }else {
      resolve(UploadResult.FAIL)
    }
  })


  function generateRandomNumber() {
    // 生成一个介于 0 和 1 之间的随机数
    const randomNumber = Math.random();
  
    // 如果随机数小于等于0.5，则返回1，否则返回2
    if (randomNumber <= 0.5) {
      return 1;
    } else {
      return 2;
    }
  }
  
}

