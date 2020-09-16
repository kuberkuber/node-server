FROM node:10.21.0
LABEL maintainer="Jungeun Shin <jungeun9729@gmail.com>"

RUN mkdir -p /app
WORKDIR /app
ADD . /app

# aws-iam-authenticator
RUN mkdir -p /bin
WORKDIR /bin
RUN curl -o aws-iam-authenticator https://amazon-eks.s3.us-west-2.amazonaws.com/1.17.9/2020-08-04/bin/linux/amd64/aws-iam-authenticator
RUN chmod +x ./aws-iam-authenticator
RUN export PATH=$PATH:/bin
RUN echo 'export PATH=$PATH:/bin' >> /.bashrc
RUN mkdir -p /.aws/
ADD ./.aws/credentials /.aws/credentials
ENV AWS_SHARED_CREDENTIALS_FILE /.aws/credentials

# kubeconfig
RUN mkdir -p /.kube/
ENV KUBECONFIG /.kube/config
ADD ./.kube/config /.kube/

# clientSecret설정필요
WORKDIR /app
RUN npm install
ENV NODE_ENV development
EXPOSE 5000 5000

CMD ["npm", "start"]
