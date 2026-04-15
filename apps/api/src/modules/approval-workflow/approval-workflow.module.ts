import { Module } from '@nestjs/common';
import { WorkflowService } from './services/workflow.service';
import { WorkflowController } from './api/controllers/workflow.controller';

@Module({
  providers: [WorkflowService],
  controllers: [WorkflowController],
  exports: [WorkflowService],
})
export class ApprovalWorkflowModule {}
