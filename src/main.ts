import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule} from '@nestjs/swagger';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
  .setTitle('Library_Management_API')
  .setDescription('This is the test of swagger API')
  .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document )


  await app.listen(process.env.PORT ?? 5000);
  console.log(`click ${await app.getUrl()}`);
}
bootstrap();
