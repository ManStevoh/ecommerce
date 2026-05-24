import { Body, Controller, Post } from "@nestjs/common";
import { SendNotificationDto } from "./dto/send-notification.dto";
import { NotificationsService } from "./notifications.service";

@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post("email")
  sendEmail(@Body() dto: SendNotificationDto) {
    return this.notificationsService.sendEmail(dto);
  }

  @Post("sms")
  sendSms(@Body() dto: SendNotificationDto) {
    return this.notificationsService.sendSms(dto);
  }

  @Post("whatsapp")
  sendWhatsApp(@Body() dto: SendNotificationDto) {
    return this.notificationsService.sendWhatsApp(dto);
  }

  @Post("push")
  sendPush(@Body() dto: SendNotificationDto) {
    return this.notificationsService.sendPush(dto);
  }
}
