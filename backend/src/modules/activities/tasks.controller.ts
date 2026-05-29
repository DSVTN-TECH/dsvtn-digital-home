import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { TasksService } from './tasks.service'
import { CreateTaskDto } from './dto/create-task.dto'
import { UpdateTaskDto } from './dto/update-task.dto'

@ApiTags('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
@Controller('admin')
export class TasksController {
  constructor(private readonly service: TasksService) {}

  @Get('activities/:activityId/tasks')
  @ApiOperation({ summary: 'List tasks of activity (admin)' })
  list(@Param('activityId') activityId: string) {
    return this.service.listForActivity(activityId)
  }

  @Post('activities/:activityId/tasks')
  @ApiOperation({ summary: 'Add task to activity (admin)' })
  create(@Param('activityId') activityId: string, @Body() dto: CreateTaskDto) {
    return this.service.create(activityId, dto)
  }

  @Patch('tasks/:id')
  @ApiOperation({ summary: 'Update task (admin)' })
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.service.update(id, dto)
  }
}
