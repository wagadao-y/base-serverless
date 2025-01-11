ARG AMAZON_LINUX_TAG
FROM public.ecr.aws/amazonlinux/amazonlinux:${AMAZON_LINUX_TAG:-2023}

# 開発ツールとランタイムのインストール
RUN dnf update -y \
  && dnf install -y \
  curl-minimal \
  make \
  git \
  tar \
  gzip \
  unzip \
  zip \
  jq \
  which \
  && dnf clean all \
  && rm -rf /var/cache/dnf/*

# AWS CLI v2のインストール
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" \
  && unzip awscliv2.zip \
  && ./aws/install \
  && rm -rf aws awscliv2.zip \
  && aws --version

# 開発ユーザーの設定
ENV USERNAME=vscode
ENV USER_UID=1000
ENV USER_GID=$USER_UID

RUN groupadd --gid $USER_GID $USERNAME \
  && useradd --uid $USER_UID --gid $USER_GID -m $USERNAME \
  && dnf install -y sudo \
  && echo "$USERNAME ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers.d/$USERNAME \
  && chmod 0440 /etc/sudoers.d/$USERNAME

# 作業フォルダ作成
WORKDIR /workspace
RUN chown $USERNAME:$USERNAME /workspace

# 以降はvscodeユーザーで実行
USER $USERNAME

# Node.jsのインストール
ARG NVM_NODE_VERSION
ENV NVM_DIR="/home/$USERNAME/.nvm"

RUN touch ~/.bashrc && chmod +x ~/.bashrc \
  && curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash \
  && . $NVM_DIR/nvm.sh \
  && nvm install ${NVM_NODE_VERSION:-22} \
  && nvm alias default ${NVM_NODE_VERSION:-22} \
  && nvm use default \
  && node --version \
  && npm --version

# Node.jsのパスを環境変数に追加
ENV PATH $NVM_DIR/versions/node/$NVM_NODE_VERSION/bin:$PATH

# シェル設定
RUN echo "alias ll='ls -alF'" >> /home/$USERNAME/.bashrc \
  && echo '[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"' >> /home/$USERNAME/.bashrc \
  && echo '[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"' >> /home/$USERNAME/.bashrc \
  && echo 'export PS1="\[\033[1;32m\]\W\[\033[0m\]\$ "' >> /home/$USERNAME/.bashrc
