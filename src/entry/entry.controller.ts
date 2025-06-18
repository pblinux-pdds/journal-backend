import { Body, Controller, Get, Param, Post, Query, UploadedFile, UseInterceptors } from "@nestjs/common";
import { EntryService } from "./entry.service";
import { FileInterceptor } from "@nestjs/platform-express";

@Controller('entry')
export class EntryController {
    constructor(private readonly service: EntryService) {}

    @Get()
    async findAll(
        @Query('limit') limit = '10',
        @Query('lastKey') lastKeyStr?: string
    ) {
        const parsedLastKey = lastKeyStr ? JSON.parse(decodeURIComponent(lastKeyStr)) : undefined
        const result = await this.service.findAll(Number(limit), parsedLastKey)
        return result
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return await this.service.findOne(id)
    }

    @Post()
    @UseInterceptors(FileInterceptor('image'))
    async create(
        @Body() body: { title: string; content: string },
        @UploadedFile() file: Express.Multer.File 
    ) {
        return this.service.create(body.title, body.content, file)
    }
}
