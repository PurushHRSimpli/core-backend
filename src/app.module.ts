import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppLoggerMiddleware } from './middleware/reqResLog.middleware';
import { MongodbModule } from './mongodb/mongodb.module';
import { UserModule } from './user/user.module';
import { RoleModule } from './role/role.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TransformInterceptor } from './interceptors/responseInterceptor';
import { CompanyModule } from './company/company.module';
import { LoginModule } from './login/login.module';
import { CommunityModule } from './community/community.module';

@Module({
    imports: [MongodbModule, UserModule, RoleModule, CompanyModule,CommunityModule, LoginModule],
    controllers: [AppController],
    providers: [
        {
            provide: APP_INTERCEPTOR,
            useClass: TransformInterceptor,
        },
        AppService,
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer): void {
        consumer.apply(AppLoggerMiddleware).forRoutes('*');
    }
}