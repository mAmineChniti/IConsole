import { Server } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
export function GetDistroIcon({ imageName }: { imageName: string }) {
  const [imageError, setImageError] = useState(false);
  const name = imageName.toLowerCase();

  const baseLogoUrl =
    "https://raw.githubusercontent.com/lutgaru/linux-distro-logos/master";

  const distroLogos: Record<string, { filename: string; alt: string }> = {
    ubuntu: {
      filename: "ubuntu.png",
      alt: "Ubuntu",
    },
    kubuntu: {
      filename: "kubuntu.png",
      alt: "Kubuntu",
    },
    xubuntu: {
      filename: "xubuntu.png",
      alt: "Xubuntu",
    },
    lubuntu: {
      filename: "lubuntu.png",
      alt: "Lubuntu",
    },
    edubuntu: {
      filename: "edubuntu.png",
      alt: "Edubuntu",
    },
    ubuntustudio: {
      filename: "ubuntustudio.png",
      alt: "Ubuntu Studio",
    },
    mythbuntu: {
      filename: "mythbuntu.png",
      alt: "Mythbuntu",
    },
    centos: {
      filename: "centos.png",
      alt: "CentOS",
    },
    rhel: {
      filename: "redhat.png",
      alt: "Red Hat Enterprise Linux",
    },
    redhat: {
      filename: "redhat.png",
      alt: "Red Hat",
    },
    fedora: {
      filename: "fedora.png",
      alt: "Fedora",
    },
    scientific: {
      filename: "scientific.png",
      alt: "Scientific Linux",
    },
    debian: {
      filename: "debian.png",
      alt: "Debian",
    },
    mint: {
      filename: "mint.png",
      alt: "Linux Mint",
    },
    arch: {
      filename: "arch.png",
      alt: "Arch Linux",
    },
    manjaro: {
      filename: "manjaro.png",
      alt: "Manjaro",
    },
    antergos: {
      filename: "arch.png",
      alt: "Antergos",
    },
    opensuse: {
      filename: "suse.png",
      alt: "openSUSE",
    },
    suse: {
      filename: "suse.png",
      alt: "SUSE",
    },
    slackware: {
      filename: "slackware.png",
      alt: "Slackware",
    },
    alpine: {
      filename: "alpine.png",
      alt: "Alpine Linux",
    },
    gentoo: {
      filename: "gentoo.png",
      alt: "Gentoo",
    },
    mageia: {
      filename: "mageia.png",
      alt: "Mageia",
    },
    mandriva: {
      filename: "mandriva.png",
      alt: "Mandriva",
    },
    pclinuxos: {
      filename: "pclinuxos.png",
      alt: "PCLinuxOS",
    },
    puppy: {
      filename: "puppy.png",
      alt: "Puppy Linux",
    },
    sabayon: {
      filename: "sabayon.png",
      alt: "Sabayon",
    },
    elementary: {
      filename: "elementary.png",
      alt: "elementary OS",
    },
    zorin: {
      filename: "zorin.png",
      alt: "Zorin OS",
    },
    kali: {
      filename: "backtrack.png",
      alt: "Kali Linux",
    },
    windows: {
      filename: "",
      alt: "Windows",
    },
  };

  let matchedDistro = undefined;
  for (const [key, distroInfo] of Object.entries(distroLogos)) {
    if (name.includes(key)) {
      matchedDistro = { ...distroInfo, key };
      break;
    }
  }

  if (matchedDistro) {
    if (matchedDistro.key === "windows") {
      return (
        <div className="flex-shrink-0">
          {!imageError ? (
            <Image
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Windows_logo_-_2012.svg/32px-Windows_logo_-_2012.svg.png"
              alt={matchedDistro.alt}
              width={32}
              height={32}
              className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
              onError={() => setImageError(true)}
            />
          ) : (
            <Server className="h-6 w-6 sm:h-8 sm:w-8 text-gray-600 dark:text-gray-400 flex-shrink-0" />
          )}
        </div>
      );
    }

    return (
      <div className="flex-shrink-0">
        {!imageError ? (
          <Image
            src={`${baseLogoUrl}/${matchedDistro.filename}`}
            alt={matchedDistro.alt}
            width={32}
            height={32}
            className="w-6 h-6 sm:w-8 sm:h-8 object-contain"
            onError={() => setImageError(true)}
          />
        ) : (
          <Server className="h-6 w-6 sm:h-8 sm:w-8 text-gray-600 dark:text-gray-400 flex-shrink-0" />
        )}
      </div>
    );
  }

  return (
    <div className="flex-shrink-0">
      <Server className="h-6 w-6 sm:h-8 sm:w-8 text-gray-600 dark:text-gray-400 flex-shrink-0" />
    </div>
  );
}
