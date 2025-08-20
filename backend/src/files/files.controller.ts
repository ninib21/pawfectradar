import { Controller, Get, Post, Delete, Param, Body, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService, UploadFileDto } from './files.service';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get('status')
  async getFileStatus() {
    return this.filesService.getFileStatus();
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { userId: string; category: string }
  ) {
    const uploadDto: UploadFileDto = {
      file,
      userId: body.userId,
      category: body.category as 'profile' | 'pet' | 'document' | 'other',
    };
    return this.filesService.uploadFile(uploadDto);
  }

  @Get('info/:fileId')
  async getFileInfo(@Param('fileId') fileId: string) {
    return this.filesService.getFileInfo(fileId);
  }

  @Get('user/:userId')
  async getFilesByUser(@Param('userId') userId: string) {
    return this.filesService.getFilesByUser(userId);
  }

  @Get('category/:category')
  async getFilesByCategory(@Param('category') category: string) {
    return this.filesService.getFilesByCategory(category);
  }

  @Delete(':fileId')
  async deleteFile(@Param('fileId') fileId: string) {
    return this.filesService.deleteFile(fileId);
  }
}
