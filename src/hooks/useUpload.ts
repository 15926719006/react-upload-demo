import { UploadManager, File, UploadStatus } from './../manager/upload-manager';
import { useState, ChangeEvent, useEffect } from "react";
import { generateUniqueId } from '../utils';
import { _UploadRequest } from "../test/test";

export interface FileExtra extends File, Partial<UploadStatus> {}

const uploader = new UploadManager(_UploadRequest)

export const useUpload = () => {
  // 渲染的文件列表
  const [filesState, setFiles] = useState<FileExtra[]>(uploader._files);

  // 添加文件
  const addFile = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    // 多选添加 超出的不添加
    files?.forEach(file=> {
      const _generateUniqueId = generateUniqueId(file.name)
      uploader.add({ id: _generateUniqueId, name: file.name, size: file.size });
    })
  }

  useEffect(() => {
    // 更新hooks中的文件列表
    const updateFiles = () => {
      setFiles(uploader.files.map((file: File)=> {
        return {
          ...file,
          ...uploader._uploadStatuses.get(file.id)
        }
      }))
    }

    // 订阅更新
    uploader.subscribe(updateFiles);

    // 卸载取消订阅
    return () => {
      uploader.unsubscribe(updateFiles);
    };
  }, []);

  // 单文件上传
  const uploadClick = async (file: FileExtra) => {
    await uploader.upload(file)
  }

  // 全部文件上传
  const uploadAllClick = async () => {
    await uploader.allUpload()
  }


  return {
    filesState,
    addFile,
    uploadClick,
    uploadAllClick
  };
}