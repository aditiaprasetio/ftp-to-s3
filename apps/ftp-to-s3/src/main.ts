import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { OutputExceptionFilter } from './core/output.filter';
import { OutputInterceptor } from './core/output.interceptor';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error']
  });

  app.useGlobalInterceptors(new OutputInterceptor());
  app.useGlobalFilters(new OutputExceptionFilter());
  // app.enableCors({ origin: true, exposedHeaders: ['*'] });
  // app.use(bodyParser.json({ limit: '100mb' }))
  // app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }))

  const port = process.env.HTTP_PORT || 4000;
  await app.listen(port);
  console.info('localhost:' + port)

}
bootstrap();
