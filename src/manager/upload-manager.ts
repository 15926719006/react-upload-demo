/** 最大文件数 */
const MAX_LIMIT = 5
/** 最大文件大小 5M */
const MAX_SIZE = 1024 * 1024 * 5

/** 所有文件上传状态 */
export enum AllFilesUploadStatus {
  WAITING = 'waiting',
  ALL_SUCCESS = 'all_success',
  HAS_PENDING = 'has_pending',
  HAS_FAIL = 'has_fail'
}

/** 单个文件上传状态 */
export enum UploadResult {
  SUCCESS = 'success',
  PENDING = 'pending',
  FAIL = 'fail'
}

/** 上传结果 */
export interface UploadStatus {
  // 进度
  progress: number
  // 结果
  result: UploadResult
}

/** 上传文件 */
export interface File extends Partial<Blob> {
  // 文件标识
  id: string
  // 文件名
  name: string
}

class UploadManager {
  // 上传方法
  _uploadMethod: Function | undefined = undefined
  // 当前所有上传状态
  _uploadStatuses: Map<string, UploadStatus> = new Map()
  // 文件列表
  _files: File[] = []
  // 订阅者
  private subscribers: Function[] = [];

  constructor(fn: Function) {
    this.setUploadMethod(fn)
  }

  // 订阅
  public subscribe(callback: Function) {
    this.subscribers.push(callback);
  }

  // 取消订阅
  public unsubscribe(callback: Function) {
    this.subscribers = this.subscribers.filter(subscriber => subscriber !== callback);
  }

  // 通知
  private notifySubscribers() {
    this.subscribers.forEach(subscriber => subscriber());
  }

  // 设置上传方法
  setUploadMethod = (uploadMethod: Function) => {
    this._uploadMethod = uploadMethod
  }

  // 获取文件列表
  get files () {
    return this._files
  }

  // 添加文件
  add = (file: File) => {
    if(this._files.length >= MAX_LIMIT) {
      console.log(`文件数不得大于${MAX_LIMIT}`)
      return
    }

    this._files.push(file)
    // 每次添加新任务，默认进度为0，状态为等待中
    this._uploadStatuses.set(file.id, {progress: 0, result: UploadResult.PENDING})
    this.notifySubscribers();
  }

  /** 单个上传 */
  upload = async (file: File): Promise<UploadResult | void>  => {
    if(!file.id) {
      console.log('未获取文件');
      return
    }

    if(!this._uploadMethod) {
      console.log('请先设置上传方法');
      return
    }

    // 已成功的不需要开始任务
    if(this._uploadStatuses.get(file.id)?.result === UploadResult.SUCCESS) {
      return
    }

    try {
      let result = null
      if(file.size! > MAX_SIZE) {
        const chunkFiles = splitFile(file!) || []
        result = Promise.all(chunkFiles?.map(item=> this._uploadMethod!(item.id)))
      }else {
        result = await this._uploadMethod(file.id)
      }
      if(result === UploadResult.SUCCESS) {
        this._uploadStatuses.set(file.id, {progress: 100, result: UploadResult.SUCCESS})
      }else {
        this._uploadStatuses.set(file.id, {progress: 0, result: UploadResult.FAIL})
      }
      this.notifySubscribers();
      return result
    } catch (error) {
      this._uploadStatuses.set(file.id, {progress: 0, result: UploadResult.FAIL})
      this.notifySubscribers();
      return UploadResult.FAIL
    }

    // 拆分文件
    function splitFile(file: File) {
      if(!file) return
      const chunkSize = 1024 * 1024 * 1
      const fileChunkList = [];
      let curChunkIndex = 0;
      while (curChunkIndex <= file.size!) {
        fileChunkList.push({ id: file.id })
        curChunkIndex += chunkSize;
      }
      return fileChunkList
    }
  }

  
  /** 全部开始上传 */
  allUpload = async (): Promise<UploadResult | void>  => {
    if(!this._uploadMethod) {
      console.log('请先设置上传方法');
      return
    }

    if(this._files.length > MAX_LIMIT) {
      console.log(`文件数不得大于${MAX_LIMIT}`)
      return
    }

    try {
      await Promise.all(this._files.map((item) => this.upload(item)));
      this.notifySubscribers();
      return UploadResult.SUCCESS;
    } catch (error) {
      this.notifySubscribers();
      return UploadResult.FAIL;
    }
  }

}

export { UploadManager }