import { Module } from '@nestjs/common';
import { ConfigService } from './config/config.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from './config/config.module';

@Module({
  imports: ConfigService.isConfigured()
    ? [
        TypeOrmModule.forRoot({
          type: 'mysql',
          ...ConfigService.getConfig()?.db,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: true,
        }),
        AuthModule,
        ServeStaticModule.forRoot({
          rootPath: join(__dirname, '..', 'public'),
          exclude: ['/api/'], // 排除 API 路径
        }),
      ]
    : [ConfigModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
